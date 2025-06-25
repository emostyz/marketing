"use client"

import { useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  BarChart3, 
  TrendingUp, 
  Target, 
  Calendar, 
  Users, 
  DollarSign,
  ArrowRight,
  Play,
  Star,
  Upload,
  FileText,
  CheckCircle
} from 'lucide-react'
import UnifiedLayout from '@/components/layout/UnifiedLayout'
import Link from 'next/link'

const templateData = {
  'executive-summary': {
    name: 'Executive Performance Summary',
    description: 'High-level overview with KPIs, trends, and strategic recommendations.',
    icon: BarChart3,
    color: 'from-blue-500 to-purple-600',
    features: ['KPI Dashboard', 'Trend Analysis', 'Strategic Recommendations'],
    slides: 6
  },
  'campaign-analysis': {
    name: 'Marketing Campaign Analysis',
    description: 'Comprehensive analysis of marketing performance, ROI, and optimization opportunities.',
    icon: TrendingUp,
    color: 'from-green-500 to-teal-600',
    features: ['Channel Performance', 'ROI Metrics', 'Optimization Tips'],
    slides: 8
  },
  'sales-performance': {
    name: 'Sales Performance Review',
    description: 'Sales metrics, pipeline analysis, and revenue forecasting insights.',
    icon: Target,
    color: 'from-orange-500 to-red-600',
    features: ['Sales Metrics', 'Pipeline Analysis', 'Revenue Forecasting'],
    slides: 7
  },
  'quarterly-review': {
    name: 'Quarterly Business Review',
    description: 'Comprehensive quarterly performance analysis with strategic insights.',
    icon: Calendar,
    color: 'from-purple-500 to-indigo-600',
    features: ['Quarterly Summary', 'Key Learnings', 'Next Quarter Plans'],
    slides: 10
  },
  'customer-insights': {
    name: 'Customer Behavior Analysis',
    description: 'Deep dive into customer segments, behavior patterns, and engagement metrics.',
    icon: Users,
    color: 'from-pink-500 to-rose-600',
    features: ['Customer Segments', 'Behavior Patterns', 'Retention Analysis'],
    slides: 6
  },
  'financial-overview': {
    name: 'Financial Performance Overview',
    description: 'Financial metrics, profitability analysis, and budget performance.',
    icon: DollarSign,
    color: 'from-emerald-500 to-green-600',
    features: ['Revenue Analysis', 'Cost Breakdown', 'Profitability Metrics'],
    slides: 8
  }
}

export default function DemoPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [templateId, setTemplateId] = useState<string | null>(null)
  const [template, setTemplate] = useState<any>(null)
  const [step, setStep] = useState(1)
  const [file, setFile] = useState<File | null>(null)

  useEffect(() => {
    const id = searchParams.get('template')
    setTemplateId(id)
    if (id && templateData[id as keyof typeof templateData]) {
      setTemplate(templateData[id as keyof typeof templateData])
    } else {
      // If no template specified, default to executive-summary
      setTemplate(templateData['executive-summary'])
      setTemplateId('executive-summary')
    }
  }, [searchParams])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      // Auto-advance after file selection
      setTimeout(() => {
        setStep(2)
        console.log('Demo: File uploaded successfully', selectedFile.name)
      }, 1000)
    }
  }

  const handleUploadClick = () => {
    // Trigger file input
    document.getElementById('demo-file-input')?.click()
  }

  const handleCreateDeck = () => {
    // For demo, simulate deck generation
    setStep(3)
    
    // Simulate AI processing time
    setTimeout(() => {
      console.log('Demo: Presentation generation simulated')
    }, 2000)
  }

  const handleSignUp = () => {
    router.push('/auth/signup')
  }

  if (!template) {
    return (
      <UnifiedLayout className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl text-white mb-4">Template not found</h1>
          <Button onClick={() => router.push('/templates?demo=true')}>
            Back to Templates
          </Button>
        </div>
      </UnifiedLayout>
    )
  }

  const IconComponent = template.icon

  return (
    <UnifiedLayout className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <Play className="w-8 h-8 text-yellow-400 mr-3" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
              Demo: {template.name}
            </h1>
          </div>
          <p className="text-xl text-blue-200 mb-4">
            Experience how AEDRIN transforms your data into executive-ready presentations
          </p>
          <div className="flex items-center justify-center space-x-4">
            <Badge variant="secondary" className="bg-blue-900/50 text-blue-200">
              {template.slides} slides
            </Badge>
            <Badge variant="secondary" className="bg-green-900/50 text-green-200">
              Demo Mode
            </Badge>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            <div className={`flex items-center ${step >= 1 ? 'text-blue-400' : 'text-gray-500'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-blue-500' : 'bg-gray-600'}`}>
                {step > 1 ? <CheckCircle className="w-5 h-5" /> : '1'}
              </div>
              <span className="ml-2">Choose Template</span>
            </div>
            <div className="w-16 h-0.5 bg-gray-600"></div>
            <div className={`flex items-center ${step >= 2 ? 'text-blue-400' : 'text-gray-500'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-blue-500' : 'bg-gray-600'}`}>
                {step > 2 ? <CheckCircle className="w-5 h-5" /> : '2'}
              </div>
              <span className="ml-2">Upload Data</span>
            </div>
            <div className="w-16 h-0.5 bg-gray-600"></div>
            <div className={`flex items-center ${step >= 3 ? 'text-blue-400' : 'text-gray-500'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-blue-500' : 'bg-gray-600'}`}>
                3
              </div>
              <span className="ml-2">Generate Deck</span>
            </div>
          </div>
        </div>

        {/* Template Preview */}
        <Card className="mb-8 bg-white/5 backdrop-blur-sm border-white/20">
          <CardHeader>
            <div className={`w-full h-48 mb-4 rounded-lg bg-gradient-to-br ${template.color} flex items-center justify-center relative overflow-hidden`}>
              <IconComponent className="w-16 h-16 text-white" />
              <div className="absolute inset-0 bg-black/20" />
            </div>
            <CardTitle className="text-2xl text-white">{template.name}</CardTitle>
            <CardDescription className="text-blue-200 text-lg">
              {template.description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Key Features</h3>
                <ul className="space-y-2">
                  {template.features.map((feature: string, index: number) => (
                    <li key={index} className="text-blue-200 flex items-center">
                      <div className="w-2 h-2 bg-blue-400 rounded-full mr-3" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">What You'll Get</h3>
                <div className="space-y-3">
                  <div className="flex items-center text-blue-200">
                    <FileText className="w-5 h-5 mr-3" />
                    {template.slides} professionally designed slides
                  </div>
                  <div className="flex items-center text-blue-200">
                    <BarChart3 className="w-5 h-5 mr-3" />
                    AI-generated insights and narratives
                  </div>
                  <div className="flex items-center text-blue-200">
                    <Star className="w-5 h-5 mr-3" />
                    Executive-ready presentation
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Steps */}
        {step === 1 && (
          <div className="text-center">
            <input
              id="demo-file-input"
              type="file"
              accept=".csv,.xlsx,.xls,.json"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button 
              size="lg" 
              className="bg-blue-600 text-lg px-8 py-4 transition-colors"
              onClick={handleUploadClick}
            >
              <Upload className="w-5 h-5 mr-2" />
              {file ? `Uploading ${file.name}...` : 'Upload Your Data to Continue'}
            </Button>
            <p className="text-blue-300 mt-4">
              Upload CSV, Excel, or JSON files to see how AEDRIN transforms your data
            </p>
            {file && (
              <div className="mt-4 text-green-400">
                <CheckCircle className="w-5 h-5 inline mr-2" />
                File selected: {file.name} ({Math.round(file.size / 1024)}KB)
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="text-center">
            <Card className="bg-green-900/20 border-green-500/30 mb-6">
              <CardContent className="pt-6">
                <div className="flex items-center justify-center mb-4">
                  <CheckCircle className="w-8 h-8 text-green-400 mr-3" />
                  <h3 className="text-xl text-white">Data Uploaded Successfully!</h3>
                </div>
                <p className="text-green-200">
                  {file ? `Your file "${file.name}" has been processed and analyzed.` : 'Your data has been processed and analyzed.'} Ready to generate your presentation.
                </p>
              </CardContent>
            </Card>
            <Button 
              size="lg" 
              className="bg-green-600 text-lg px-8 py-4 transition-colors"
              onClick={handleCreateDeck}
            >
              <BarChart3 className="w-5 h-5 mr-2" />
              Generate {template.name}
            </Button>
          </div>
        )}

        {step === 3 && (
          <div className="text-center">
            <Card className="bg-purple-900/20 border-purple-500/30 mb-6">
              <CardContent className="pt-6">
                <div className="flex items-center justify-center mb-4">
                  <Star className="w-8 h-8 text-purple-400 mr-3" />
                  <h3 className="text-xl text-white">Presentation Generated!</h3>
                </div>
                <p className="text-purple-200 mb-4">
                  Your {template.name} has been created with AI-powered insights and professional design.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="text-purple-300">
                    <div className="font-semibold">{template.slides} Slides</div>
                    <div>Created</div>
                  </div>
                  <div className="text-purple-300">
                    <div className="font-semibold">AI Analysis</div>
                    <div>Completed</div>
                  </div>
                  <div className="text-purple-300">
                    <div className="font-semibold">Ready to</div>
                    <div>Present</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <div className="space-y-4">
              <Button 
                size="lg" 
                className="bg-purple-600 text-lg px-8 py-4 transition-colors"
                onClick={handleSignUp}
              >
                <ArrowRight className="w-5 h-5 mr-2" />
                Sign Up to Access Your Deck
              </Button>
              <div>
                <Button 
                  variant="outline" 
                  className="border-blue-400 text-blue-200 hover:bg-blue-600"
                  onClick={() => router.push('/templates?demo=true')}
                >
                  Try Another Template
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-16 text-center">
          <p className="text-blue-300 mb-4">
            Ready to create your own executive presentations?
          </p>
          <Link href="/auth/signup">
            <Button 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 text-lg font-semibold transition-colors"
            >
              🚀 Get Started with AEDRIN
            </Button>
          </Link>
        </div>
      </div>
    </UnifiedLayout>
  )
}