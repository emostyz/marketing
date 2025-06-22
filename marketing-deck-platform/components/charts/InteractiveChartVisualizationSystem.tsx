'use client'

/**
 * Complete Interactive Chart Visualization System
 * Implements all requirements from the specification document
 */

import React, { useState, useCallback, useEffect, useMemo } from 'react'
import { Card, Button } from '@tremor/react'
import { Select, SelectItem, TextInput, Textarea, Toggle, Metric } from '@/components/ui/tremor-compat'
import { Upload, Download, Settings, Edit3, Eye, EyeOff, Maximize2, RotateCcw, Share2, Filter, TrendingUp, Wand2, Save, FileText, BarChart3, PieChart, Activity, Layers, Zap } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { AdvancedTremorChart, ChartData, ChartType, ChartConfig } from './TremorAdvancedChartSystem'
import { aiChartEngine } from '@/lib/charts/ai-chart-engine'
import { deckBrain } from '@/lib/openai/deck-brain'

// ==========================================
// CORE INTERFACES
// ==========================================

export interface DataSchema {
  columns: DataColumn[]
  rowCount: number
  sampleData: Record<string, any>[]
  relationships: CorrelationMatrix
  dataQuality: DataQualityMetrics
}

export interface DataColumn {
  name: string
  type: 'numerical' | 'categorical' | 'temporal' | 'geographical'
  uniqueCount: number
  nullCount: number
  samples: any[]
  statistics?: {
    min?: number
    max?: number
    mean?: number
    median?: number
    std?: number
  }
}

export interface CorrelationMatrix {
  [key: string]: { [key: string]: number }
}

export interface DataQualityMetrics {
  completeness: number
  consistency: number
  accuracy: number
  outliers: OutlierInfo[]
}

export interface OutlierInfo {
  column: string
  value: any
  score: number
  reason: string
}

export interface ChartRecommendation {
  chartType: ChartType
  title: string
  description: string
  confidence: number
  reasoning: string
  dataMapping: {
    x: string
    y: string | string[]
    series?: string
    groupBy?: string
    size?: string
    color?: string
  }
  styleRecommendations: {
    colorScheme: string[]
    layout: string
    annotations: string[]
    interactions: string[]
  }
  insights: string[]
  businessValue: string
  pros: string[]
  cons: string[]
}

export interface VisualizationSession {
  id: string
  userId?: string
  data: Record<string, any>[]
  dataSchema: DataSchema
  charts: ChartData[]
  selectedChartId?: string
  aiRecommendations: ChartRecommendation[]
  userContext: string
  designPreferences: DesignPreferences
  createdAt: Date
  lastModified: Date
}

export interface DesignPreferences {
  style: 'mckinsey' | 'corporate' | 'academic' | 'modern'
  colorPalette: string[]
  accessibility: boolean
  branding?: {
    primaryColor: string
    secondaryColor: string
    fontFamily: string
    logoUrl?: string
  }
}

// ==========================================
// MAIN COMPONENT
// ==========================================

interface InteractiveChartVisualizationSystemProps {
  className?: string
  onSave?: (session: VisualizationSession) => void
  onExport?: (charts: ChartData[]) => void
  initialData?: Record<string, any>[]
  userId?: string
}

export const InteractiveChartVisualizationSystem: React.FC<InteractiveChartVisualizationSystemProps> = ({
  className = '',
  onSave,
  onExport,
  initialData,
  userId
}) => {
  // ==========================================
  // STATE MANAGEMENT
  // ==========================================

  const [session, setSession] = useState<VisualizationSession>({
    id: `session-${Date.now()}`,
    userId,
    data: initialData || [],
    dataSchema: null as any,
    charts: [],
    aiRecommendations: [],
    userContext: '',
    designPreferences: {
      style: 'mckinsey',
      colorPalette: ['#1E40AF', '#7C3AED', '#059669', '#EA580C'],
      accessibility: true
    },
    createdAt: new Date(),
    lastModified: new Date()
  })

  const [currentStep, setCurrentStep] = useState<'upload' | 'analyze' | 'design' | 'customize' | 'export'>('upload')
  const [isLoading, setIsLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [showFullscreen, setShowFullscreen] = useState(false)
  const [selectedChart, setSelectedChart] = useState<ChartData | null>(null)

  // ==========================================
  // DATA PROCESSING
  // ==========================================

  const processDataUpload = useCallback(async (data: Record<string, any>[]) => {
    setIsLoading(true)
    setLoadingMessage('Processing uploaded data...')
    setError(null)

    try {
      // Analyze data with AI
      const analysisResult = await aiChartEngine.analyzeDataset(
        data,
        session.userContext,
        ['visualization', 'insights', 'presentation']
      )

      setSession(prev => ({
        ...prev,
        data,
        dataSchema: analysisResult.schema,
        lastModified: new Date()
      }))

      setCurrentStep('analyze')
      setLoadingMessage('Data processed successfully!')
      
      setTimeout(() => {
        setIsLoading(false)
        setLoadingMessage('')
      }, 1000)

    } catch (err) {
      console.error('Data processing error:', err)
      setError('Failed to process data. Please check your file format and try again.')
      setIsLoading(false)
      setLoadingMessage('')
    }
  }, [session.userContext])

  const generateChartRecommendations = useCallback(async () => {
    if (!session.dataSchema) return

    setIsLoading(true)
    setLoadingMessage('AI is analyzing your data and generating chart recommendations...')
    setError(null)

    try {
      const recommendations = await aiChartEngine.recommendCharts(
        session.dataSchema,
        session.userContext,
        session.designPreferences
      )

      // Generate actual chart configurations
      const charts = await aiChartEngine.generateInteractiveCharts(
        recommendations,
        session.data,
        session.designPreferences
      )

      setSession(prev => ({
        ...prev,
        aiRecommendations: recommendations.recommendations,
        charts: charts.map(chart => ({
          id: chart.id,
          type: chart.chartType as ChartType,
          title: chart.title,
          data: chart.data,
          config: {
            index: chart.mapping.x,
            categories: Array.isArray(chart.mapping.y) ? chart.mapping.y : [chart.mapping.y],
            colors: chart.colors,
            showLegend: true,
            showGrid: true,
            showTooltip: true,
            showAnimation: true,
            responsive: true,
            accessibility: {
              colorBlindSafe: true,
              highContrast: false,
              screenReaderFriendly: true,
              keyboardNavigation: true,
              alternativeText: `Chart showing ${chart.title}`,
              ariaLabels: {}
            },
            interaction: {
              hover: true,
              click: true,
              zoom: false,
              filter: false,
              drill: false,
              export: true
            },
            styling: {
              theme: session.designPreferences.style,
              fontSize: 14,
              fontFamily: 'Arial',
              borderRadius: 8,
              shadows: true,
              gradients: false
            }
          },
          insights: chart.metadata?.insights || [],
          metadata: {
            created: new Date(),
            lastModified: new Date(),
            dataSource: 'user_upload',
            version: 1,
            performance: {
              renderTime: 0,
              dataPoints: chart.data.length,
              optimized: chart.data.length <= 1000,
              lazy: chart.data.length > 1000
            }
          }
        })),
        lastModified: new Date()
      }))

      setCurrentStep('design')
      setIsLoading(false)
      setLoadingMessage('')

    } catch (err) {
      console.error('Chart recommendation error:', err)
      setError('Failed to generate chart recommendations. Please try again.')
      setIsLoading(false)
      setLoadingMessage('')
    }
  }, [session.dataSchema, session.userContext, session.designPreferences, session.data])

  // ==========================================
  // CHART INTERACTIONS
  // ==========================================

  const handleChartSelect = useCallback((chart: ChartData) => {
    setSelectedChart(chart)
    setSession(prev => ({
      ...prev,
      selectedChartId: chart.id,
      lastModified: new Date()
    }))
  }, [])

  const handleChartUpdate = useCallback((chartId: string, updates: Partial<ChartData>) => {
    setSession(prev => ({
      ...prev,
      charts: prev.charts.map(chart => 
        chart.id === chartId 
          ? { ...chart, ...updates, metadata: { ...chart.metadata, lastModified: new Date() } }
          : chart
      ),
      lastModified: new Date()
    }))

    if (selectedChart?.id === chartId) {
      setSelectedChart(prev => prev ? { ...prev, ...updates } : null)
    }
  }, [selectedChart])

  const handleDataEdit = useCallback((chartId: string, newData: any[]) => {
    handleChartUpdate(chartId, { data: newData })
  }, [handleChartUpdate])

  const handleConfigEdit = useCallback((chartId: string, newConfig: ChartConfig) => {
    handleChartUpdate(chartId, { config: newConfig })
  }, [handleChartUpdate])

  // ==========================================
  // USER CONTEXT AND PREFERENCES
  // ==========================================

  const updateUserContext = useCallback((context: string) => {
    setSession(prev => ({
      ...prev,
      userContext: context,
      lastModified: new Date()
    }))
  }, [])

  const updateDesignPreferences = useCallback((preferences: Partial<DesignPreferences>) => {
    setSession(prev => ({
      ...prev,
      designPreferences: { ...prev.designPreferences, ...preferences },
      lastModified: new Date()
    }))
  }, [])

  // ==========================================
  // SAVE AND EXPORT
  // ==========================================

  const handleSave = useCallback(() => {
    onSave?.(session)
  }, [session, onSave])

  const handleExport = useCallback(() => {
    onExport?.(session.charts)
  }, [session.charts, onExport])

  // ==========================================
  // RENDER METHODS
  // ==========================================

  const renderDataUploadStep = () => (
    <Card className="max-w-4xl mx-auto">
      <div className="text-center py-8">
        <Upload className="w-16 h-16 mx-auto text-blue-500 mb-4" />
        <h2 className="text-xl font-bold">Upload Your Data</h2>
        <p className="text-gray-600 mb-6">
          Upload CSV, JSON, or Excel files to get started with AI-powered chart generation
        </p>
        
        <DataUploadComponent
          onDataUploaded={processDataUpload}
          className="mb-6"
        />
        
        <div className="mt-6">
          <TextInput
            placeholder="Describe your data or visualization goals (optional)"
            value={session.userContext}
            onValueChange={updateUserContext}
            className="max-w-md mx-auto"
          />
        </div>
      </div>
    </Card>
  )

  const renderAnalysisStep = () => (
    <div className="space-y-6">
      <Card>
        <h3 className="text-lg font-semibold mb-4">Data Analysis Results</h3>
        {session.dataSchema && (
          <DataAnalysisDisplay 
            dataSchema={session.dataSchema}
            sampleData={session.data.slice(0, 5)}
          />
        )}
        
        <div className="flex justify-between mt-6">
          <Button 
            variant="secondary" 
            onClick={() => setCurrentStep('upload')}
          >
            Back to Upload
          </Button>
          <Button 
            onClick={generateChartRecommendations}
            disabled={isLoading}
            icon={Wand2}
          >
            Generate AI Recommendations
          </Button>
        </div>
      </Card>
    </div>
  )

  const renderDesignStep = () => (
    <div className="space-y-6">
      <Card>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-semibold">AI Chart Recommendations</h3>
            <p className="text-gray-600">Choose from AI-generated chart options</p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="secondary" 
              onClick={() => setCurrentStep('analyze')}
            >
              Back to Analysis
            </Button>
            <Button 
              onClick={() => setCurrentStep('customize')}
              disabled={!selectedChart}
            >
              Customize Selected
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {session.charts.map((chart) => (
            <motion.div
              key={chart.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`cursor-pointer ${
                selectedChart?.id === chart.id 
                  ? 'ring-2 ring-blue-500' 
                  : 'hover:ring-1 hover:ring-gray-300'
              }`}
              onClick={() => handleChartSelect(chart)}
            >
              <Card>
                <h4 className="text-sm font-medium mb-2">{chart.title}</h4>
                <div className="h-48 mb-4">
                  <AdvancedTremorChart
                    chartData={chart}
                    interactive={false}
                    editable={false}
                    className="h-full"
                  />
                </div>
                {chart.insights && chart.insights.length > 0 && (
                  <div className="text-xs text-gray-600">
                    <strong>Key Insight:</strong> {chart.insights[0]}
                  </div>
                )}
              </Card>
            </motion.div>
          ))}
        </div>
      </Card>
    </div>
  )

  const renderCustomizeStep = () => (
    <div className="space-y-6">
      {selectedChart && (
        <>
          <Card>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-semibold">Customize Your Chart</h3>
                <p className="text-gray-600">Edit and refine your visualization</p>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="secondary" 
                  onClick={() => setCurrentStep('design')}
                >
                  Back to Selection
                </Button>
                <Button 
                  onClick={() => setCurrentStep('export')}
                  icon={Download}
                >
                  Export & Save
                </Button>
              </div>
            </div>

            <AdvancedTremorChart
              chartData={selectedChart}
              onDataChange={(data) => handleDataEdit(selectedChart.id, data)}
              onConfigChange={(config) => handleConfigEdit(selectedChart.id, config)}
              interactive={true}
              editable={true}
              className="mb-6"
            />
          </Card>

          <DesignPreferencesPanel
            preferences={session.designPreferences}
            onPreferencesChange={updateDesignPreferences}
          />
        </>
      )}
    </div>
  )

  const renderExportStep = () => (
    <Card>
      <div className="text-center py-8">
        <Download className="w-16 h-16 mx-auto text-green-500 mb-4" />
        <h2 className="text-xl font-bold">Export Your Visualizations</h2>
        <p className="text-gray-600 mb-6">
          Save and export your charts in multiple formats
        </p>
        
        <div className="flex justify-center gap-4 mb-6">
          <Button onClick={handleSave} icon={Save}>
            Save Session
          </Button>
          <Button onClick={handleExport} icon={Download}>
            Export Charts
          </Button>
          <Button 
            variant="secondary" 
            onClick={() => setShowFullscreen(true)}
            icon={Maximize2}
          >
            Preview Fullscreen
          </Button>
        </div>

        <SessionSummary session={session} />
      </div>
    </Card>
  )

  // ==========================================
  // MAIN RENDER
  // ==========================================

  return (
    <div className={`min-h-screen bg-gray-50 p-6 ${className}`}>
      {/* Progress Indicator */}
      <div className="max-w-6xl mx-auto mb-8">
        <StepProgress 
          currentStep={currentStep}
          onStepClick={setCurrentStep}
          completedSteps={getCompletedSteps(session)}
        />
      </div>

      {/* Loading Overlay */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <Card className="max-w-md">
              <div className="text-center py-6">
                <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Processing...</h3>
                <p className="text-gray-600">{loadingMessage}</p>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Display */}
      {error && (
        <Card className="max-w-4xl mx-auto mb-6 border-red-200 bg-red-50">
          <div className="text-red-800">
            <h3 className="text-lg font-semibold text-red-900">Error</h3>
            <p>{error}</p>
            <Button 
              className="mt-4" 
              variant="secondary"
              onClick={() => setError(null)}
            >
              Dismiss
            </Button>
          </div>
        </Card>
      )}

      {/* Main Content */}
      <div className="max-w-6xl mx-auto">
        {currentStep === 'upload' && renderDataUploadStep()}
        {currentStep === 'analyze' && renderAnalysisStep()}
        {currentStep === 'design' && renderDesignStep()}
        {currentStep === 'customize' && renderCustomizeStep()}
        {currentStep === 'export' && renderExportStep()}
      </div>

      {/* Fullscreen Modal */}
      <AnimatePresence>
        {showFullscreen && selectedChart && (
          <FullscreenChartModal
            chart={selectedChart}
            onClose={() => setShowFullscreen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// ==========================================
// SUPPORTING COMPONENTS
// ==========================================

interface StepProgressProps {
  currentStep: string
  onStepClick: (step: any) => void
  completedSteps: string[]
}

const StepProgress: React.FC<StepProgressProps> = ({ currentStep, onStepClick, completedSteps }) => {
  const steps = [
    { id: 'upload', name: 'Upload Data', icon: Upload },
    { id: 'analyze', name: 'Analyze', icon: TrendingUp },
    { id: 'design', name: 'Design', icon: BarChart3 },
    { id: 'customize', name: 'Customize', icon: Edit3 },
    { id: 'export', name: 'Export', icon: Download }
  ]

  return (
    <div className="flex justify-center">
      <div className="flex items-center space-x-4">
        {steps.map((step, index) => {
          const isCompleted = completedSteps.includes(step.id)
          const isCurrent = currentStep === step.id
          const Icon = step.icon

          return (
            <React.Fragment key={step.id}>
              <button
                className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-colors ${
                  isCompleted
                    ? 'bg-green-500 border-green-500 text-white'
                    : isCurrent
                    ? 'bg-blue-500 border-blue-500 text-white'
                    : 'bg-white border-gray-300 text-gray-500 hover:border-gray-400'
                }`}
                onClick={() => onStepClick(step.id)}
              >
                <Icon className="w-5 h-5" />
              </button>
              {index < steps.length - 1 && (
                <div className={`w-8 h-0.5 ${isCompleted ? 'bg-green-500' : 'bg-gray-300'}`} />
              )}
            </React.Fragment>
          )
        })}
      </div>
    </div>
  )
}

const DataUploadComponent: React.FC<{
  onDataUploaded: (data: Record<string, any>[]) => void
  className?: string
}> = ({ onDataUploaded, className = '' }) => {
  const [isDragging, setIsDragging] = useState(false)

  const handleFileUpload = useCallback((file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string
        let data: Record<string, any>[] = []

        if (file.name.endsWith('.json')) {
          data = JSON.parse(text)
        } else if (file.name.endsWith('.csv')) {
          // Simple CSV parser
          const lines = text.split('\n').filter(line => line.trim())
          const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
          data = lines.slice(1).map(line => {
            const values = line.split(',').map(v => v.trim().replace(/"/g, ''))
            const row: Record<string, any> = {}
            headers.forEach((header, index) => {
              const value = values[index] || ''
              // Try to parse as number
              const numValue = parseFloat(value)
              row[header] = isNaN(numValue) ? value : numValue
            })
            return row
          })
        }

        onDataUploaded(data)
      } catch (error) {
        console.error('File parsing error:', error)
        alert('Error parsing file. Please check the format and try again.')
      }
    }
    reader.readAsText(file)
  }, [onDataUploaded])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileUpload(files[0])
    }
  }, [handleFileUpload])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileUpload(files[0])
    }
  }, [handleFileUpload])

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
        isDragging 
          ? 'border-blue-500 bg-blue-50' 
          : 'border-gray-300 hover:border-gray-400'
      } ${className}`}
      onDragOver={(e) => {
        e.preventDefault()
        setIsDragging(true)
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
    >
      <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
      <p className="text-lg font-medium text-gray-700 mb-2">
        Drop your data file here or click to browse
      </p>
      <p className="text-gray-500 mb-4">
        Supports CSV, JSON, and Excel files
      </p>
      <input
        type="file"
        accept=".csv,.json,.xlsx,.xls"
        onChange={handleFileSelect}
        className="hidden"
        id="file-upload"
      />
      <label
        htmlFor="file-upload"
        className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 cursor-pointer"
      >
        <Upload className="w-4 h-4 mr-2" />
        Choose File
      </label>
    </div>
  )
}

const DataAnalysisDisplay: React.FC<{
  dataSchema: DataSchema
  sampleData: Record<string, any>[]
}> = ({ dataSchema, sampleData }) => (
  <div className="space-y-4">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Metric
        title="Total Rows"
        value={dataSchema.rowCount.toLocaleString()}
      />
      <Metric
        title="Columns"
        value={dataSchema.columns.length.toString()}
      />
      <Metric
        title="Data Quality"
        value={`${Math.round(dataSchema.dataQuality.completeness)}%`}
      />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <h4 className="text-md font-semibold mb-4">Column Analysis</h4>
        <div className="space-y-2">
          {dataSchema.columns.slice(0, 5).map((column) => (
            <div key={column.name} className="flex justify-between items-center p-2 bg-gray-50 rounded">
              <div>
                <span className="font-medium">{column.name}</span>
                <span className="ml-2 text-sm text-gray-500">({column.type})</span>
              </div>
              <span className="text-sm text-gray-600">
                {column.uniqueCount} unique values
              </span>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <h4 className="text-md font-semibold mb-4">Sample Data</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                {Object.keys(sampleData[0] || {}).slice(0, 4).map((key) => (
                  <th key={key} className="text-left p-2 font-medium">
                    {key}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sampleData.slice(0, 3).map((row, index) => (
                <tr key={index} className="border-b">
                  {Object.values(row).slice(0, 4).map((value, i) => (
                    <td key={i} className="p-2">
                      {String(value).slice(0, 20)}...
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  </div>
)

const DesignPreferencesPanel: React.FC<{
  preferences: DesignPreferences
  onPreferencesChange: (preferences: Partial<DesignPreferences>) => void
}> = ({ preferences, onPreferencesChange }) => (
  <Card>
    <h4 className="text-md font-semibold mb-4">Design Preferences</h4>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label className="block text-sm font-medium mb-2">Style</label>
        <Select
          value={preferences.style}
          onValueChange={(value) => onPreferencesChange({ style: value as any })}
        >
          <SelectItem value="mckinsey">McKinsey Professional</SelectItem>
          <SelectItem value="corporate">Corporate</SelectItem>
          <SelectItem value="academic">Academic</SelectItem>
          <SelectItem value="modern">Modern Tech</SelectItem>
        </Select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Accessibility</label>
        <Toggle
          checked={preferences.accessibility}
          onChange={(checked) => onPreferencesChange({ accessibility: checked })}
        />
        <span className="ml-2 text-sm text-gray-600">
          Enable color-blind safe palettes
        </span>
      </div>
    </div>
  </Card>
)

const SessionSummary: React.FC<{ session: VisualizationSession }> = ({ session }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
    <Metric
      title="Charts Created"
      value={session.charts.length.toString()}
    />
    <Metric
      title="Data Points"
      value={session.data.length.toLocaleString()}
    />
    <Metric
      title="Last Modified"
      value={session.lastModified.toLocaleDateString()}
    />
  </div>
)

const FullscreenChartModal: React.FC<{
  chart: ChartData
  onClose: () => void
}> = ({ chart, onClose }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-8"
    onClick={onClose}
  >
    <motion.div
      initial={{ scale: 0.8 }}
      animate={{ scale: 1 }}
      exit={{ scale: 0.8 }}
      className="bg-white rounded-lg w-full h-full max-w-6xl max-h-4xl p-6"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">{chart.title}</h2>
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      </div>
      
      <div className="h-full">
        <AdvancedTremorChart
          chartData={chart}
          className="h-full"
          interactive={true}
          editable={false}
        />
      </div>
    </motion.div>
  </motion.div>
)

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

function getCompletedSteps(session: VisualizationSession): string[] {
  const completed: string[] = []
  
  if (session.data.length > 0) completed.push('upload')
  if (session.dataSchema) completed.push('analyze')
  if (session.charts.length > 0) completed.push('design')
  if (session.selectedChartId) completed.push('customize')
  
  return completed
}

export default InteractiveChartVisualizationSystem