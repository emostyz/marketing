'use client'

import React, { useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Upload, 
  Brain, 
  ThumbsUp, 
  Edit3, 
  Wand2, 
  FileText, 
  CheckCircle,
  AlertCircle,
  Clock,
  Database,
  BarChart3
} from 'lucide-react'
import { DataIntakeSystem, type Dataset } from '@/lib/data/data-intake-system'
import { firstPassAnalysis, type FirstPassAnalysis, type AnalysisContext } from '@/lib/ai/openai-first-pass-analysis'
import AnalysisReviewUI from '@/components/ai/AnalysisReviewUI'
import SlideStructureEditor from '@/components/ai/SlideStructureEditor'
import { insightFeedbackLoop, type UserFeedback, type SlideStructure } from '@/lib/ai/insight-feedback-loop'

type PipelineStage = 
  | 'upload' 
  | 'analysis' 
  | 'review' 
  | 'feedback' 
  | 'structure' 
  | 'editing' 
  | 'generation'
  | 'complete'

interface PipelineState {
  stage: PipelineStage
  dataset?: Dataset
  analysis?: FirstPassAnalysis
  feedback?: UserFeedback
  slideStructure?: SlideStructure
  error?: string
  isProcessing: boolean
  processingMessage: string
  metadata?: {
    uploadTime?: number
    analysisTime?: number
    feedbackTime?: number
    structureTime?: number
  }
}

export default function TestAIPipelinePage() {
  const [state, setState] = useState<PipelineState>({
    stage: 'upload',
    isProcessing: false,
    processingMessage: '',
    metadata: {}
  })

  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [dragActive, setDragActive] = useState(false)

  // Mock sample data for testing without actual file upload
  const createMockDataset = useCallback((): Dataset => {
    const mockData = [
      { date: '2024-01-01', product: 'Product A', sales: 1000, region: 'North', customer_type: 'Enterprise' },
      { date: '2024-01-02', product: 'Product B', sales: 1500, region: 'South', customer_type: 'SMB' },
      { date: '2024-01-03', product: 'Product A', sales: 1200, region: 'East', customer_type: 'Enterprise' },
      { date: '2024-01-04', product: 'Product C', sales: 800, region: 'West', customer_type: 'Startup' },
      { date: '2024-01-05', product: 'Product B', sales: 1800, region: 'North', customer_type: 'Enterprise' }
    ]

    return {
      id: crypto.randomUUID(),
      filename: 'sample_sales_data.csv',
      uploadedAt: new Date(),
      userId: 'test_user',
      fileType: 'csv',
      size: 1024,
      rows: mockData.length,
      columns: ['date', 'product', 'sales', 'region', 'customer_type'],
      schema: {
        date: 'date',
        product: 'categorical',
        sales: 'number',
        region: 'categorical',
        customer_type: 'categorical'
      },
      preview: mockData,
      processed: true,
      metadata: {
        hasHeaders: true,
        encoding: 'utf-8',
        delimiter: ',',
        numericColumns: ['sales'],
        categoricalColumns: ['product', 'region', 'customer_type'],
        dateColumns: ['date']
      }
    }
  }, [])

  const createMockAnalysis = useCallback((): FirstPassAnalysis => {
    return {
      executiveSummary: "Sales data analysis reveals strong performance in Enterprise segment with Product B leading revenue generation. Key opportunities identified in regional expansion and customer type diversification strategies.",
      keyFindings: [
        {
          title: "Enterprise Segment Dominance",
          insight: "Enterprise customers account for 60% of total sales volume with highest average transaction values",
          dataEvidence: "Enterprise sales: $4000 total, SMB: $1500, Startup: $800",
          businessImpact: 'high' as const,
          confidence: 0.9,
          relatedMetrics: ['sales', 'customer_type']
        },
        {
          title: "Product B Performance Leadership",
          insight: "Product B generates highest revenue per transaction with 33% revenue share",
          dataEvidence: "Product B total sales: $3300, Product A: $2200, Product C: $800",
          businessImpact: 'high' as const,
          confidence: 0.85,
          relatedMetrics: ['product', 'sales']
        },
        {
          title: "Regional Performance Variation",
          insight: "North region shows strongest performance with consistent high-value transactions",
          dataEvidence: "North region sales: $2800, South: $1500, East: $1200, West: $800",
          businessImpact: 'medium' as const,
          confidence: 0.8,
          relatedMetrics: ['region', 'sales']
        }
      ],
      trends: [
        {
          metric: 'sales',
          direction: 'increasing' as const,
          magnitude: 0.7,
          significance: 'high' as const,
          timeframe: '5-day period',
          description: 'Overall sales trend showing positive growth trajectory'
        },
        {
          metric: 'product_performance',
          direction: 'stable' as const,
          magnitude: 0.6,
          significance: 'medium' as const,
          description: 'Product mix remains consistent with Product B maintaining leadership'
        }
      ],
      correlations: [
        {
          variables: ['customer_type', 'sales'],
          relationship: 'positive' as const,
          strength: 0.8,
          interpretation: "Enterprise customers consistently generate higher sales volumes",
          actionable: true
        },
        {
          variables: ['product', 'region'],
          relationship: 'positive' as const,
          strength: 0.6,
          interpretation: "Certain products perform better in specific regions",
          actionable: true
        }
      ],
      recommendations: [
        {
          title: "Expand Enterprise Sales Focus",
          action: "Increase sales resources allocation to Enterprise segment and develop enterprise-specific product features",
          priority: 'immediate' as const,
          expectedImpact: 'high' as const,
          feasibility: 'easy' as const,
          requiredResources: ['Sales team expansion', 'Enterprise features development'],
          successMetrics: ['Enterprise revenue growth', 'Customer acquisition rate']
        },
        {
          title: "Regional Expansion Strategy",
          action: "Replicate North region success factors in underperforming regions (East, West)",
          priority: 'short_term' as const,
          expectedImpact: 'medium' as const,
          feasibility: 'moderate' as const,
          requiredResources: ['Regional analysis', 'Marketing investment'],
          successMetrics: ['Regional revenue balance', 'Market penetration']
        }
      ],
      dataQuality: {
        completeness: 0.95,
        reliability: 'high' as const,
        limitations: ['Small sample size', 'Short time period'],
        suggestedImprovements: ['Expand data collection period', 'Include more product categories']
      }
    }
  }, [])

  // Stage 1: File Upload
  const handleFileUpload = useCallback(async (file?: File) => {
    setState(prev => ({ 
      ...prev, 
      isProcessing: true, 
      processingMessage: 'Processing file upload...',
      error: undefined 
    }))

    try {
      const startTime = Date.now()
      
      let dataset: Dataset
      
      if (file) {
        // Real file processing
        const dataIntakeSystem = new DataIntakeSystem()
        const result = await dataIntakeSystem.validateAndProcessFile(file, 'test_user')
        
        if (!result.success || !result.data) {
          throw new Error(result.error || 'File processing failed')
        }
        
        dataset = result.data
      } else {
        // Mock data for testing
        dataset = createMockDataset()
        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 1500))
      }

      const uploadTime = Date.now() - startTime

      setState(prev => ({
        ...prev,
        stage: 'analysis',
        dataset,
        isProcessing: false,
        metadata: { ...prev.metadata, uploadTime }
      }))

      // Auto-proceed to analysis
      setTimeout(() => handleAnalysis(dataset), 1000)

    } catch (error) {
      setState(prev => ({
        ...prev,
        isProcessing: false,
        error: error instanceof Error ? error.message : 'Upload failed'
      }))
    }
  }, [])

  // Stage 2: AI Analysis
  const handleAnalysis = useCallback(async (dataset: Dataset) => {
    setState(prev => ({ 
      ...prev, 
      isProcessing: true, 
      processingMessage: 'AI analyzing your data...',
      error: undefined 
    }))

    try {
      const startTime = Date.now()
      
      const context: AnalysisContext = {
        userGoals: 'Generate actionable business insights for sales performance',
        businessContext: 'Sales data analysis for strategic planning',
        industryType: 'Technology/Software',
        timeframe: 'Recent sales period'
      }

      let analysis: FirstPassAnalysis
      
      if (process.env.NODE_ENV === 'development') {
        // Use mock data in development to avoid API costs
        analysis = createMockAnalysis()
        await new Promise(resolve => setTimeout(resolve, 3000)) // Simulate API call
      } else {
        // Real analysis in production
        const result = await firstPassAnalysis.analyzeDataset(dataset, context, 'test_session')
        
        if (!result.success || !result.data) {
          throw new Error(result.error || 'Analysis failed')
        }
        
        analysis = result.data
      }

      const analysisTime = Date.now() - startTime

      setState(prev => ({
        ...prev,
        stage: 'review',
        analysis,
        isProcessing: false,
        metadata: { ...prev.metadata, analysisTime }
      }))

    } catch (error) {
      setState(prev => ({
        ...prev,
        isProcessing: false,
        error: error instanceof Error ? error.message : 'Analysis failed'
      }))
    }
  }, [])

  // Stage 3: User Review and Feedback
  const handleFeedback = useCallback(async (feedback: UserFeedback) => {
    setState(prev => ({ 
      ...prev, 
      isProcessing: true, 
      processingMessage: 'Processing your feedback...',
      error: undefined 
    }))

    try {
      const startTime = Date.now()
      
      if (!state.analysis || !state.dataset) {
        throw new Error('Missing analysis or dataset')
      }

      // Process feedback and generate slide structure
      const result = await insightFeedbackLoop.processFeedbackAndGenerateStructure(
        state.analysis,
        feedback,
        'test_session',
        {
          filename: state.dataset.filename,
          rows: state.dataset.rows,
          columns: state.dataset.columns.length
        }
      )

      if (!result.success || !result.slideStructure) {
        throw new Error(result.error || 'Feedback processing failed')
      }

      const feedbackTime = Date.now() - startTime

      setState(prev => ({
        ...prev,
        stage: 'structure',
        feedback,
        slideStructure: result.slideStructure,
        isProcessing: false,
        metadata: { ...prev.metadata, feedbackTime }
      }))

    } catch (error) {
      setState(prev => ({
        ...prev,
        isProcessing: false,
        error: error instanceof Error ? error.message : 'Feedback processing failed'
      }))
    }
  }, [state.analysis, state.dataset])

  const handleProceedToSlideGeneration = useCallback(() => {
    setState(prev => ({ ...prev, stage: 'editing' }))
  }, [])

  // Stage 4: Slide Structure Editing
  const handleStructureChange = useCallback((structure: SlideStructure) => {
    setState(prev => ({ ...prev, slideStructure: structure }))
  }, [])

  const handleSaveStructure = useCallback(() => {
    // Save structure logic here
    console.log('Saving structure...', state.slideStructure)
  }, [state.slideStructure])

  const handlePreviewStructure = useCallback(() => {
    // Preview logic here
    console.log('Previewing structure...', state.slideStructure)
  }, [state.slideStructure])

  const handleGenerateSlides = useCallback(async () => {
    setState(prev => ({ 
      ...prev, 
      isProcessing: true, 
      processingMessage: 'Generating final presentation...',
      stage: 'generation'
    }))

    try {
      // Simulate slide generation
      await new Promise(resolve => setTimeout(resolve, 4000))
      
      setState(prev => ({
        ...prev,
        stage: 'complete',
        isProcessing: false
      }))

    } catch (error) {
      setState(prev => ({
        ...prev,
        isProcessing: false,
        error: error instanceof Error ? error.message : 'Slide generation failed'
      }))
    }
  }, [])

  // File drop handlers
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      const file = files[0]
      setUploadedFile(file)
      handleFileUpload(file)
    }
  }, [handleFileUpload])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      const file = files[0]
      setUploadedFile(file)
      handleFileUpload(file)
    }
  }, [handleFileUpload])

  const getStageProgress = () => {
    const stageIndex = ['upload', 'analysis', 'review', 'feedback', 'structure', 'editing', 'generation', 'complete'].indexOf(state.stage)
    return ((stageIndex + 1) / 8) * 100
  }

  const getStageIcon = (stage: PipelineStage) => {
    const icons = {
      upload: Upload,
      analysis: Brain,
      review: ThumbsUp,
      feedback: ThumbsUp,
      structure: Edit3,
      editing: Edit3,
      generation: Wand2,
      complete: CheckCircle
    }
    return icons[stage]
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">AI Slide Generation Pipeline Test</h1>
          <p className="text-gray-600">Complete end-to-end testing of the AI-powered slide generation system</p>
        </div>

        {/* Progress Bar */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium">Pipeline Progress</span>
              <span className="text-sm text-gray-500">{Math.round(getStageProgress())}% Complete</span>
            </div>
            <Progress value={getStageProgress()} className="mb-4" />
            
            <div className="flex items-center justify-between">
              {['upload', 'analysis', 'review', 'structure', 'generation', 'complete'].map((stage, index) => {
                const Icon = getStageIcon(stage as PipelineStage)
                const isActive = state.stage === stage
                const isCompleted = getStageProgress() > (index / 6) * 100
                
                return (
                  <div key={stage} className={`flex flex-col items-center ${isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-400'}`}>
                    <div className={`rounded-full p-2 mb-1 ${isActive ? 'bg-blue-100' : isCompleted ? 'bg-green-100' : 'bg-gray-100'}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-medium capitalize">{stage.replace('_', ' ')}</span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Error Display */}
        {state.error && (
          <Alert className="mb-6" variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{state.error}</AlertDescription>
          </Alert>
        )}

        {/* Processing Indicator */}
        {state.isProcessing && (
          <Card className="mb-6 border-blue-200 bg-blue-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className="text-blue-900 font-medium">{state.processingMessage}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stage Content */}
        <div className="space-y-6">
          {/* Stage 1: File Upload */}
          {state.stage === 'upload' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Data Upload
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div
                    className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                      dragActive 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                  >
                    <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-lg font-medium text-gray-700 mb-2">
                      Upload your data file
                    </p>
                    <p className="text-gray-500 mb-4">
                      Drag and drop your CSV, XLSX, or JSON file here, or click to browse
                    </p>
                    <input
                      type="file"
                      id="file-upload"
                      className="hidden"
                      accept=".csv,.xlsx,.xls,.json"
                      onChange={handleFileSelect}
                    />
                    <label htmlFor="file-upload">
                      <Button variant="outline" className="cursor-pointer">
                        Select File
                      </Button>
                    </label>
                  </div>

                  <div className="text-center">
                    <div className="text-gray-500 mb-4">— OR —</div>
                    <Button onClick={() => handleFileUpload()} variant="default">
                      Use Sample Data for Testing
                    </Button>
                  </div>

                  {uploadedFile && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium mb-2">Selected File:</h4>
                      <p className="text-sm text-gray-600">
                        {uploadedFile.name} ({(uploadedFile.size / 1024).toFixed(1)} KB)
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Stage 2: Analysis */}
          {state.stage === 'analysis' && state.dataset && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  AI Analysis in Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Badge variant="outline">
                      {state.dataset.filename}
                    </Badge>
                    <span className="text-sm text-gray-600">
                      {state.dataset.rows.toLocaleString()} rows × {state.dataset.columns.length} columns
                    </span>
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-blue-900">
                      Our AI is analyzing your data to identify key insights, trends, and business recommendations. 
                      This typically takes 30-60 seconds.
                    </p>
                  </div>

                  {state.metadata?.uploadTime && (
                    <p className="text-sm text-gray-600">
                      Upload completed in {state.metadata.uploadTime}ms
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Stage 3: Review */}
          {state.stage === 'review' && state.analysis && state.dataset && (
            <AnalysisReviewUI
              analysis={state.analysis}
              datasetInfo={{
                filename: state.dataset.filename,
                rows: state.dataset.rows,
                columns: state.dataset.columns.length,
                uploadedAt: state.dataset.uploadedAt.toISOString()
              }}
              metadata={{
                processingTime: state.metadata?.analysisTime || 0,
                confidence: 0.85,
                modelUsed: 'gpt-4-turbo-preview'
              }}
              onFeedback={handleFeedback}
              onProceed={handleProceedToSlideGeneration}
              isSubmitting={state.isProcessing}
            />
          )}

          {/* Stage 4: Slide Structure */}
          {state.stage === 'structure' && state.slideStructure && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Slide Structure Generated
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-green-900 font-medium mb-2">✅ Feedback processed successfully!</p>
                    <p className="text-green-800">
                      Generated a {state.slideStructure.slides.length}-slide presentation structure 
                      based on your approved insights and feedback.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{state.slideStructure.slides.length}</div>
                      <div className="text-sm text-gray-600">Slides</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{state.slideStructure.recommendedDuration}</div>
                      <div className="text-sm text-gray-600">Minutes</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{state.slideStructure.keyMetrics.length}</div>
                      <div className="text-sm text-gray-600">Key Metrics</div>
                    </div>
                  </div>

                  <Button onClick={() => setState(prev => ({ ...prev, stage: 'editing' }))} className="w-full">
                    Edit Slide Structure
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Stage 5: Editing */}
          {state.stage === 'editing' && state.slideStructure && (
            <SlideStructureEditor
              initialStructure={state.slideStructure}
              onStructureChange={handleStructureChange}
              onSave={handleSaveStructure}
              onPreview={handlePreviewStructure}
              onGenerateSlides={handleGenerateSlides}
              isGenerating={state.isProcessing}
              hasUnsavedChanges={false}
            />
          )}

          {/* Stage 6: Generation */}
          {state.stage === 'generation' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wand2 className="h-5 w-5" />
                  Generating Final Presentation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-blue-900">
                      Creating your final presentation with charts, styling, and interactive elements. 
                      This may take a few minutes...
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Generating slide content...</span>
                      <span>25%</span>
                    </div>
                    <Progress value={25} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Stage 7: Complete */}
          {state.stage === 'complete' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Presentation Complete!
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="bg-green-50 p-6 rounded-lg text-center">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-green-900 mb-2">
                      Your AI-generated presentation is ready!
                    </h3>
                    <p className="text-green-800">
                      Complete with data-driven insights, professional styling, and interactive charts.
                    </p>
                  </div>

                  {/* Performance Metrics */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <Clock className="h-6 w-6 text-gray-600 mx-auto mb-2" />
                      <div className="text-lg font-bold">{state.metadata?.uploadTime || 0}ms</div>
                      <div className="text-xs text-gray-600">Upload Time</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <Brain className="h-6 w-6 text-gray-600 mx-auto mb-2" />
                      <div className="text-lg font-bold">{state.metadata?.analysisTime || 0}ms</div>
                      <div className="text-xs text-gray-600">Analysis Time</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <ThumbsUp className="h-6 w-6 text-gray-600 mx-auto mb-2" />
                      <div className="text-lg font-bold">{state.metadata?.feedbackTime || 0}ms</div>
                      <div className="text-xs text-gray-600">Feedback Time</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <FileText className="h-6 w-6 text-gray-600 mx-auto mb-2" />
                      <div className="text-lg font-bold">{state.slideStructure?.slides.length || 0}</div>
                      <div className="text-xs text-gray-600">Slides Generated</div>
                    </div>
                  </div>

                  <div className="flex gap-4 justify-center">
                    <Button variant="outline" onClick={() => window.location.reload()}>
                      Test Again
                    </Button>
                    <Button>
                      View Presentation
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Debug Panel */}
        <div className="mt-12">
          <Tabs defaultValue="state" className="w-full">
            <TabsList>
              <TabsTrigger value="state">Current State</TabsTrigger>
              <TabsTrigger value="dataset">Dataset</TabsTrigger>
              <TabsTrigger value="analysis">Analysis</TabsTrigger>
              <TabsTrigger value="structure">Structure</TabsTrigger>
            </TabsList>
            
            <TabsContent value="state">
              <Card>
                <CardHeader>
                  <CardTitle>Pipeline State (Debug)</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="text-xs bg-gray-100 p-4 rounded overflow-auto max-h-96">
                    {JSON.stringify({ 
                      stage: state.stage, 
                      isProcessing: state.isProcessing,
                      metadata: state.metadata,
                      error: state.error
                    }, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="dataset">
              <Card>
                <CardHeader>
                  <CardTitle>Dataset (Debug)</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="text-xs bg-gray-100 p-4 rounded overflow-auto max-h-96">
                    {JSON.stringify(state.dataset, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="analysis">
              <Card>
                <CardHeader>
                  <CardTitle>Analysis (Debug)</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="text-xs bg-gray-100 p-4 rounded overflow-auto max-h-96">
                    {JSON.stringify(state.analysis, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="structure">
              <Card>
                <CardHeader>
                  <CardTitle>Slide Structure (Debug)</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="text-xs bg-gray-100 p-4 rounded overflow-auto max-h-96">
                    {JSON.stringify(state.slideStructure, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}