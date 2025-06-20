'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/Button'
import { Upload, X, Brain, FileText, BarChart3, TrendingUp, DollarSign, Users, Target, MessageSquare } from 'lucide-react'

interface AdvancedDataUploadModalProps {
  onClose: () => void
  onUpload: (data: any) => void
}

interface QAState {
  step: number
  datasetDescription: string
  businessGoals: string
  dataType: 'financial' | 'sales' | 'marketing' | 'strategy' | 'client' | 'other'
  keyProblems: string
  analysisType: 'performance' | 'trends' | 'comparison' | 'insights' | 'routine_check'
  targetAudience: string
  presentationStyle: 'executive' | 'detailed' | 'casual' | 'technical'
}

export function AdvancedDataUploadModal({ onClose, onUpload }: AdvancedDataUploadModalProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [presentationName, setPresentationName] = useState('')
  const [uploadedData, setUploadedData] = useState<any[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [qaState, setQAState] = useState<QAState>({
    step: 1,
    datasetDescription: '',
    businessGoals: '',
    dataType: 'financial',
    keyProblems: '',
    analysisType: 'performance',
    targetAudience: '',
    presentationStyle: 'executive'
  })

  const dataTypeOptions = [
    { value: 'financial', label: 'Financial Data', icon: DollarSign, desc: 'Revenue, expenses, profit margins' },
    { value: 'sales', label: 'Sales Performance', icon: TrendingUp, desc: 'Sales metrics, conversions, pipeline' },
    { value: 'marketing', label: 'Marketing Analytics', icon: Target, desc: 'Campaign performance, ROI, engagement' },
    { value: 'strategy', label: 'Strategic Analysis', icon: Brain, desc: 'Market research, competitive analysis' },
    { value: 'client', label: 'Client Performance', icon: Users, desc: 'Customer metrics, satisfaction, retention' },
    { value: 'other', label: 'Other', icon: FileText, desc: 'Custom dataset type' }
  ]

  const analysisTypeOptions = [
    { value: 'performance', label: 'Performance Review', desc: 'How are we doing vs targets?' },
    { value: 'trends', label: 'Trend Analysis', desc: 'What patterns do you see over time?' },
    { value: 'comparison', label: 'Comparative Analysis', desc: 'How do segments/periods compare?' },
    { value: 'insights', label: 'Deep Insights', desc: 'What hidden insights can we uncover?' },
    { value: 'routine_check', label: 'Routine Check-in', desc: 'Standard periodic review' }
  ]

  const styleOptions = [
    { value: 'executive', label: 'Executive Summary', desc: 'High-level, concise for leadership' },
    { value: 'detailed', label: 'Detailed Analysis', desc: 'Comprehensive with deep dives' },
    { value: 'casual', label: 'Team Presentation', desc: 'Friendly tone for team meetings' },
    { value: 'technical', label: 'Technical Deep-dive', desc: 'Data-focused for analysts' }
  ]

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      const text = await file.text()
      let data: any[] = []

      if (file.name.endsWith('.csv')) {
        // Parse CSV
        const lines = text.split('\n').filter(line => line.trim())
        const headers = lines[0].split(',').map(h => h.trim())
        data = lines.slice(1).map(line => {
          const values = line.split(',')
          const row: any = {}
          headers.forEach((header, index) => {
            const value = values[index]?.trim()
            // Try to convert to number if possible
            row[header] = isNaN(Number(value)) ? value : Number(value)
          })
          return row
        })
      } else if (file.name.endsWith('.json')) {
        data = JSON.parse(text)
      }

      setUploadedData(data)
      setCurrentStep(2) // Move to Q&A after successful upload
    } catch (error) {
      alert('Error parsing file. Please check format.')
    } finally {
      setIsUploading(false)
    }
  }, [])

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) {
      const fakeEvent = { target: { files: [file] } } as any
      handleFileUpload(fakeEvent)
    }
  }

  const handleQANext = () => {
    if (qaState.step < 6) {
      setQAState(prev => ({ ...prev, step: prev.step + 1 }))
    } else {
      handleGeneratePresentation()
    }
  }

  const handleGeneratePresentation = async () => {
    // Prepare enhanced data for new AI deck builder
    const generationData = {
      title: presentationName || 'AI-Generated Presentation',
      data: uploadedData.length > 0 ? uploadedData : getSampleData(qaState.dataType),
      qaResponses: qaState,
      userRequirements: qaState.datasetDescription,
      userGoals: qaState.businessGoals,
      generateWithAI: true,
      useEnhancedBuilder: true,
      metadata: {
        dataType: qaState.dataType,
        analysisType: qaState.analysisType,
        presentationStyle: qaState.presentationStyle,
        targetAudience: qaState.targetAudience,
        keyProblems: qaState.keyProblems,
        timestamp: new Date().toISOString(),
        confidence: 0
      }
    }

    onUpload(generationData)
  }

  const getSampleData = (type: string) => {
    const sampleData: Record<string, any[]> = {
      financial: [
        { Month: 'Jan', Revenue: 145000, Expenses: 85000, Profit: 60000, Margin: 41.4 },
        { Month: 'Feb', Revenue: 152000, Expenses: 89000, Profit: 63000, Margin: 41.4 },
        { Month: 'Mar', Revenue: 148000, Expenses: 87000, Profit: 61000, Margin: 41.2 },
        { Month: 'Apr', Revenue: 161000, Expenses: 92000, Profit: 69000, Margin: 42.9 },
        { Month: 'May', Revenue: 158000, Expenses: 91000, Profit: 67000, Margin: 42.4 },
        { Month: 'Jun', Revenue: 167000, Expenses: 94000, Profit: 73000, Margin: 43.7 }
      ],
      sales: [
        { Month: 'Jan', Leads: 1200, Conversions: 180, Revenue: 145000, AvgDeal: 806 },
        { Month: 'Feb', Leads: 1350, Conversions: 202, Revenue: 152000, AvgDeal: 752 },
        { Month: 'Mar', Leads: 1180, Conversions: 189, Revenue: 148000, AvgDeal: 783 },
        { Month: 'Apr', Leads: 1500, Conversions: 225, Revenue: 161000, AvgDeal: 716 },
        { Month: 'May', Leads: 1420, Conversions: 213, Revenue: 158000, AvgDeal: 742 },
        { Month: 'Jun', Leads: 1650, Conversions: 248, Revenue: 167000, AvgDeal: 673 }
      ],
      marketing: [
        { Campaign: 'Google Ads', Spend: 25000, Impressions: 450000, Clicks: 12500, Conversions: 180, CPA: 139 },
        { Campaign: 'Facebook', Spend: 18000, Impressions: 320000, Clicks: 9800, Conversions: 145, CPA: 124 },
        { Campaign: 'LinkedIn', Spend: 15000, Impressions: 180000, Clicks: 5400, Conversions: 98, CPA: 153 },
        { Campaign: 'Email', Spend: 5000, Impressions: 85000, Clicks: 3200, Conversions: 156, CPA: 32 }
      ],
      client: [
        { Client: 'Enterprise A', Revenue: 45000, Satisfaction: 9.2, Retention: 98, Projects: 12 },
        { Client: 'Enterprise B', Revenue: 38000, Satisfaction: 8.8, Retention: 95, Projects: 8 },
        { Client: 'Mid-Market C', Revenue: 22000, Satisfaction: 9.0, Retention: 92, Projects: 6 },
        { Client: 'Enterprise D', Revenue: 52000, Satisfaction: 9.5, Retention: 100, Projects: 15 }
      ],
      strategy: [
        { Quarter: 'Q1', MarketShare: 15.2, Competitors: 8, NewFeatures: 3, UserGrowth: 12.5 },
        { Quarter: 'Q2', MarketShare: 16.1, Competitors: 9, NewFeatures: 5, UserGrowth: 18.3 },
        { Quarter: 'Q3', MarketShare: 17.2, Competitors: 10, NewFeatures: 4, UserGrowth: 22.1 },
        { Quarter: 'Q4', MarketShare: 18.5, Competitors: 11, NewFeatures: 6, UserGrowth: 28.7 }
      ],
      other: [
        { Category: 'A', Value: 100, Growth: 12.5, Target: 110 },
        { Category: 'B', Value: 150, Growth: 8.3, Target: 160 },
        { Category: 'C', Value: 120, Growth: 15.2, Target: 140 },
        { Category: 'D', Value: 180, Growth: 6.7, Target: 195 }
      ]
    }
    return sampleData[type] || sampleData.other
  }

  const renderUploadStep = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Presentation Name</label>
        <input
          type="text"
          value={presentationName}
          onChange={(e) => setPresentationName(e.target.value)}
          placeholder="e.g., Q1 Performance Review"
          className="w-full rounded-lg bg-gray-800 border border-gray-600 p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Upload Your Data</label>
        <div 
          className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center hover:border-blue-500 transition-colors cursor-pointer"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => document.getElementById('file-input')?.click()}
        >
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-300 font-semibold mb-2">
            {isUploading ? 'Processing file...' : uploadedData.length > 0 ? `✅ ${uploadedData.length} rows loaded` : 'Drag & drop your files here'}
          </p>
          <p className="text-sm text-gray-400 mb-4">Supports CSV, Excel, and JSON files</p>
          <Button variant="secondary" disabled={isUploading}>
            {isUploading ? 'Loading...' : 'Browse Files'}
          </Button>
        </div>
        <input
          id="file-input"
          type="file"
          accept=".csv,.json,.xlsx"
          onChange={handleFileUpload}
          className="hidden"
        />
        <p className="text-sm text-blue-400 mt-2">💡 Skip file upload to use sample data based on your answers</p>
      </div>

      <div className="flex gap-3 pt-4">
        <Button variant="secondary" className="flex-1" onClick={onClose}>
          Cancel
        </Button>
        <Button 
          className="flex-1" 
          onClick={() => setCurrentStep(2)}
          disabled={!presentationName.trim()}
        >
          Continue to Q&A
        </Button>
      </div>
    </div>
  )

  const renderQAStep = () => {
    switch (qaState.step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Brain className="w-12 h-12 text-blue-400 mx-auto mb-4" />
              <h4 className="text-xl font-semibold text-white mb-2">Tell me about your dataset</h4>
              <p className="text-gray-400">This helps me create more relevant insights</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">Describe your dataset in plain English:</label>
              <textarea
                value={qaState.datasetDescription}
                onChange={(e) => setQAState(prev => ({ ...prev, datasetDescription: e.target.value }))}
                placeholder="e.g., This is our monthly sales data showing revenue, lead conversions, and customer acquisition costs across different channels..."
                className="w-full h-24 rounded-lg bg-gray-800 border border-gray-600 p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Target className="w-12 h-12 text-green-400 mx-auto mb-4" />
              <h4 className="text-xl font-semibold text-white mb-2">What type of data is this?</h4>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {dataTypeOptions.map((option) => {
                const Icon = option.icon
                return (
                  <button
                    key={option.value}
                    onClick={() => setQAState(prev => ({ ...prev, dataType: option.value as any }))}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      qaState.dataType === option.value
                        ? 'border-blue-500 bg-blue-900/20'
                        : 'border-gray-600 bg-gray-800/50 hover:border-gray-500'
                    }`}
                  >
                    <Icon className="w-6 h-6 mb-2 text-blue-400" />
                    <div className="font-medium text-white">{option.label}</div>
                    <div className="text-sm text-gray-400">{option.desc}</div>
                  </button>
                )
              })}
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <MessageSquare className="w-12 h-12 text-purple-400 mx-auto mb-4" />
              <h4 className="text-xl font-semibold text-white mb-2">What are your business goals?</h4>
            </div>
            <div>
              <textarea
                value={qaState.businessGoals}
                onChange={(e) => setQAState(prev => ({ ...prev, businessGoals: e.target.value }))}
                placeholder="e.g., Increase quarterly revenue by 15%, improve conversion rates, identify our best performing channels, understand customer churn patterns..."
                className="w-full h-24 rounded-lg bg-gray-800 border border-gray-600 p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 text-orange-400 mx-auto mb-4" />
              <h4 className="text-xl font-semibold text-white mb-2">What type of analysis do you need?</h4>
            </div>
            <div className="space-y-3">
              {analysisTypeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setQAState(prev => ({ ...prev, analysisType: option.value as any }))}
                  className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                    qaState.analysisType === option.value
                      ? 'border-blue-500 bg-blue-900/20'
                      : 'border-gray-600 bg-gray-800/50 hover:border-gray-500'
                  }`}
                >
                  <div className="font-medium text-white">{option.label}</div>
                  <div className="text-sm text-gray-400">{option.desc}</div>
                </button>
              ))}
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Users className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <h4 className="text-xl font-semibold text-white mb-2">Key problems to solve</h4>
            </div>
            <div>
              <textarea
                value={qaState.keyProblems}
                onChange={(e) => setQAState(prev => ({ ...prev, keyProblems: e.target.value }))}
                placeholder="e.g., Our conversion rates are declining, we're missing revenue targets, customer acquisition costs are too high, we need to identify our most profitable segments..."
                className="w-full h-24 rounded-lg bg-gray-800 border border-gray-600 p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
          </div>
        )

      case 6:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <FileText className="w-12 h-12 text-indigo-400 mx-auto mb-4" />
              <h4 className="text-xl font-semibold text-white mb-2">Presentation style</h4>
            </div>
            <div className="space-y-3">
              {styleOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setQAState(prev => ({ ...prev, presentationStyle: option.value as any }))}
                  className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                    qaState.presentationStyle === option.value
                      ? 'border-blue-500 bg-blue-900/20'
                      : 'border-gray-600 bg-gray-800/50 hover:border-gray-500'
                  }`}
                >
                  <div className="font-medium text-white">{option.label}</div>
                  <div className="text-sm text-gray-400">{option.desc}</div>
                </button>
              ))}
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 rounded-2xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-white">
            {currentStep === 1 ? 'Create AI Presentation' : 'AI Question & Analysis'}
          </h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {currentStep === 2 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <div className="text-sm text-blue-400">Step {qaState.step} of 6</div>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all"
                style={{ width: `${(qaState.step / 6) * 100}%` }}
              />
            </div>
          </div>
        )}

        {currentStep === 1 ? renderUploadStep() : renderQAStep()}

        {currentStep === 2 && (
          <div className="flex gap-3 pt-6">
            <Button 
              variant="secondary" 
              className="flex-1" 
              onClick={() => qaState.step > 1 ? setQAState(prev => ({ ...prev, step: prev.step - 1 })) : setCurrentStep(1)}
            >
              Back
            </Button>
            <Button 
              className="flex-1" 
              onClick={handleQANext}
              disabled={
                (qaState.step === 1 && !qaState.datasetDescription.trim()) ||
                (qaState.step === 3 && !qaState.businessGoals.trim()) ||
                (qaState.step === 5 && !qaState.keyProblems.trim())
              }
            >
              {qaState.step === 6 ? 'Generate AI Presentation' : 'Next'}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}