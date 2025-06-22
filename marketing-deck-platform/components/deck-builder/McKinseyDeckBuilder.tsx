'use client'

import React, { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Upload, 
  FileText, 
  BarChart3, 
  Target, 
  TrendingUp, 
  Zap,
  Brain,
  Sparkles,
  CheckCircle
} from 'lucide-react'
import { FileParser, ParsedDataset } from '@/lib/data/file-parser'
import { McKinseyChartGenerator, McKinseySlideConfig } from '@/lib/charts/mckinsey-chart-generator'
import { AdvancedAnalyticsEngine } from '@/lib/ai/advanced-analytics-engine'
import { EnhancedBrainV2 } from '@/lib/ai/enhanced-brain-v2'
import { McKinseySlide } from '@/components/slides/McKinseySlideTemplates'

interface StepProps {
  isActive: boolean
  isCompleted: boolean
  title: string
  description: string
  icon: React.ReactNode
}

const StepIndicator: React.FC<StepProps> = ({ isActive, isCompleted, title, description, icon }) => (
  <div className={`flex items-center space-x-4 p-4 rounded-lg border-2 transition-all ${
    isActive ? 'border-blue-500 bg-blue-50' :
    isCompleted ? 'border-green-500 bg-green-50' :
    'border-gray-200 bg-gray-50'
  }`}>
    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
      isActive ? 'bg-blue-500 text-white' :
      isCompleted ? 'bg-green-500 text-white' :
      'bg-gray-300 text-gray-600'
    }`}>
      {isCompleted ? <CheckCircle className="w-6 h-6" /> : icon}
    </div>
    <div>
      <h3 className={`font-semibold ${
        isActive ? 'text-blue-900' :
        isCompleted ? 'text-green-900' :
        'text-gray-700'
      }`}>
        {title}
      </h3>
      <p className={`text-sm ${
        isActive ? 'text-blue-700' :
        isCompleted ? 'text-green-700' :
        'text-gray-500'
      }`}>
        {description}
      </p>
    </div>
  </div>
)

interface McKinseyDeckBuilderProps {
  onDeckGenerated?: (slides: any[]) => void
  className?: string
}

export const McKinseyDeckBuilder: React.FC<McKinseyDeckBuilderProps> = ({
  onDeckGenerated,
  className = ''
}) => {
  const [currentStep, setCurrentStep] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [parsedData, setParsedData] = useState<ParsedDataset | null>(null)
  const [businessContext, setBusinessContext] = useState({
    industry: '',
    businessContext: '',
    objective: ''
  })
  const [generatedSlides, setGeneratedSlides] = useState<McKinseySlideConfig[]>([])
  const [previewSlide, setPreviewSlide] = useState(0)

  const steps = [
    {
      title: 'Upload Data',
      description: 'Upload your CSV or Excel file with business data',
      icon: <Upload className="w-6 h-6" />
    },
    {
      title: 'Business Context',
      description: 'Provide context about your industry and objectives',
      icon: <Target className="w-6 h-6" />
    },
    {
      title: 'AI Analysis',
      description: 'Our AI analyzes your data for insights and patterns',
      icon: <Brain className="w-6 h-6" />
    },
    {
      title: 'Deck Generation',
      description: 'Generate McKinsey-style slides with actionable insights',
      icon: <Sparkles className="w-6 h-6" />
    },
    {
      title: 'Review & Customize',
      description: 'Review and customize your professional presentation',
      icon: <FileText className="w-6 h-6" />
    }
  ]

  const handleFileUpload = useCallback(async (file: File) => {
    setIsProcessing(true)
    try {
      console.log('📁 Parsing file:', file.name)
      const parsed = await FileParser.parseFile(file)
      console.log('✅ File parsed successfully:', parsed)
      
      setUploadedFile(file)
      setParsedData(parsed)
      setCurrentStep(1)
    } catch (error) {
      console.error('❌ Error parsing file:', error)
      alert('Error parsing file. Please ensure it\'s a valid CSV or Excel file.')
    } finally {
      setIsProcessing(false)
    }
  }, [])

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      handleFileUpload(file)
    }
  }

  const handleContextSubmit = useCallback(() => {
    if (businessContext.industry && businessContext.businessContext && businessContext.objective) {
      setCurrentStep(2)
      generateDeck()
    }
  }, [businessContext])

  const generateDeck = useCallback(async () => {
    if (!parsedData || !businessContext.industry) return

    setIsProcessing(true)
    setCurrentStep(2)

    try {
      console.log('🧠 Starting McKinsey deck generation...')

      // Generate statistical analysis
      console.log('📊 Running statistical analysis...')
      const statisticalAnalysis = AdvancedAnalyticsEngine.analyzeDataset(parsedData)
      const businessIntelligence = AdvancedAnalyticsEngine.generateBusinessIntelligence(parsedData, statisticalAnalysis)

      // Generate McKinsey-style slides
      console.log('🏢 Generating McKinsey slides...')
      const executiveSummary = McKinseyChartGenerator.generateMcKinseySlide(
        parsedData.rows,
        businessContext,
        'executive_summary'
      )

      const deepDive = McKinseyChartGenerator.generateMcKinseySlide(
        parsedData.rows,
        businessContext,
        'deep_dive'
      )

      const recommendations = McKinseyChartGenerator.generateMcKinseySlide(
        parsedData.rows,
        businessContext,
        'recommendations'
      )

      const slides = [executiveSummary, deepDive, recommendations]
      console.log('✅ Generated slides:', slides)

      setGeneratedSlides(slides)
      setCurrentStep(4)

      if (onDeckGenerated) {
        // Convert to presentation format
        const presentationSlides = slides.map((slide, index) => ({
          id: `mckinsey_slide_${index}_${Date.now()}`,
          number: index + 1,
          type: 'mckinsey' as const,
          title: slide.title,
          content: slide.subtitle || '',
          mckinseyConfig: slide,
          style: 'mckinsey' as const
        }))
        onDeckGenerated(presentationSlides)
      }

    } catch (error) {
      console.error('❌ Error generating deck:', error)
      alert('Error generating deck. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }, [parsedData, businessContext, onDeckGenerated])

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="max-w-md mx-auto">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 hover:border-blue-400 transition-colors">
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                  disabled={isProcessing}
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer flex flex-col items-center space-y-4"
                >
                  <Upload className="w-12 h-12 text-gray-400" />
                  <div>
                    <p className="text-lg font-medium text-gray-900">
                      Upload your data file
                    </p>
                    <p className="text-sm text-gray-500">
                      CSV or Excel files up to 10MB
                    </p>
                  </div>
                  <div className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors">
                    Choose File
                  </div>
                </label>
              </div>
              
              {isProcessing && (
                <div className="mt-4 flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                  <span className="text-sm text-gray-600">Parsing file...</span>
                </div>
              )}
            </div>
          </motion.div>
        )

      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto py-8"
          >
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Industry
                </label>
                <input
                  type="text"
                  value={businessContext.industry}
                  onChange={(e) => setBusinessContext(prev => ({ ...prev, industry: e.target.value }))}
                  placeholder="e.g., Technology, Healthcare, Financial Services"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Context
                </label>
                <input
                  type="text"
                  value={businessContext.businessContext}
                  onChange={(e) => setBusinessContext(prev => ({ ...prev, businessContext: e.target.value }))}
                  placeholder="e.g., Sales Performance, Marketing ROI, Customer Analytics"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Objective
                </label>
                <input
                  type="text"
                  value={businessContext.objective}
                  onChange={(e) => setBusinessContext(prev => ({ ...prev, objective: e.target.value }))}
                  placeholder="e.g., increase revenue, optimize costs, improve efficiency"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <button
                onClick={handleContextSubmit}
                disabled={!businessContext.industry || !businessContext.businessContext || !businessContext.objective}
                className="w-full bg-blue-500 text-white py-3 px-6 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Continue to Analysis
              </button>
            </div>
          </motion.div>
        )

      case 2:
      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="max-w-md mx-auto">
              <div className="relative">
                <div className="w-24 h-24 mx-auto mb-6">
                  <Brain className="w-24 h-24 text-blue-500 animate-pulse" />
                </div>
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-gray-900">
                    AI is analyzing your data
                  </h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                      <span>Running statistical analysis</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <span>Identifying key insights</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <span>Generating McKinsey-style slides</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )

      case 4:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="py-8"
          >
            {generatedSlides.length > 0 && (
              <div className="space-y-8">
                {/* Slide Navigation */}
                <div className="flex justify-center space-x-4">
                  {generatedSlides.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setPreviewSlide(index)}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        previewSlide === index
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      Slide {index + 1}
                    </button>
                  ))}
                </div>

                {/* Slide Preview */}
                <div className="bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden">
                  <div className="aspect-video">
                    <McKinseySlide
                      config={generatedSlides[previewSlide]}
                      className="w-full h-full"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={() => {
                      if (onDeckGenerated) {
                        const presentationSlides = generatedSlides.map((slide, index) => ({
                          id: `mckinsey_slide_${index}_${Date.now()}`,
                          number: index + 1,
                          type: 'mckinsey' as const,
                          title: slide.title,
                          content: slide.subtitle || '',
                          mckinseyConfig: slide,
                          style: 'mckinsey' as const
                        }))
                        onDeckGenerated(presentationSlides)
                      }
                    }}
                    className="bg-green-500 text-white px-8 py-3 rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-2"
                  >
                    <CheckCircle className="w-5 h-5" />
                    <span>Use This Deck</span>
                  </button>
                  <button
                    onClick={() => {
                      setCurrentStep(1)
                      setGeneratedSlides([])
                    }}
                    className="bg-gray-500 text-white px-8 py-3 rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Regenerate
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )

      default:
        return null
    }
  }

  return (
    <div className={`max-w-7xl mx-auto p-8 ${className}`}>
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          McKinsey-Style Deck Builder
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Transform your data into world-class presentations with AI-powered insights,
          professional visualizations, and actionable recommendations.
        </p>
      </div>

      {/* Progress Steps */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-12">
        {steps.map((step, index) => (
          <StepIndicator
            key={index}
            isActive={currentStep === index}
            isCompleted={currentStep > index}
            title={step.title}
            description={step.description}
            icon={step.icon}
          />
        ))}
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 min-h-96">
        {renderStepContent()}
      </div>

      {/* Data Summary (if available) */}
      {parsedData && currentStep > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 bg-gray-50 rounded-lg p-6"
        >
          <h3 className="font-semibold text-gray-900 mb-4">Data Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Rows:</span>
              <span className="ml-2 font-medium">{parsedData.rowCount.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-gray-500">Columns:</span>
              <span className="ml-2 font-medium">{parsedData.columns.length}</span>
            </div>
            <div>
              <span className="text-gray-500">Completeness:</span>
              <span className="ml-2 font-medium">{parsedData.insights.completeness}%</span>
            </div>
            <div>
              <span className="text-gray-500">Quality:</span>
              <span className="ml-2 font-medium">{parsedData.insights.dataQuality}</span>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}