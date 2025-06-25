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
  Sparkles,
  Zap,
  Award
} from 'lucide-react'
import { useAuth } from '@/lib/auth/auth-context'
import UnifiedLayout from '@/components/layout/UnifiedLayout'
import Link from 'next/link'

const templates = [
  {
    id: 'executive-summary',
    name: 'Executive Performance Summary',
    description: 'High-level overview with KPIs, trends, and strategic recommendations.',
    slides: 6,
    tags: ['C-suite ready', 'AI narratives'],
    purpose: 'Executive presentations',
    icon: BarChart3,
    color: 'from-blue-500 to-purple-600',
    features: ['KPI Dashboard', 'Trend Analysis', 'Strategic Recommendations']
  },
  {
    id: 'campaign-analysis',
    name: 'Marketing Campaign Analysis',
    description: 'Comprehensive analysis of marketing performance, ROI, and optimization opportunities.',
    slides: 8,
    tags: ['Data-driven', 'ROI focused'],
    purpose: 'Marketing teams',
    icon: TrendingUp,
    color: 'from-green-500 to-teal-600',
    features: ['Channel Performance', 'ROI Metrics', 'Optimization Tips']
  },
  {
    id: 'sales-performance',
    name: 'Sales Performance Review',
    description: 'Sales metrics, pipeline analysis, and revenue forecasting insights.',
    slides: 7,
    tags: ['Revenue focused', 'Pipeline analysis'],
    purpose: 'Sales teams',
    icon: Target,
    color: 'from-orange-500 to-red-600',
    features: ['Sales Metrics', 'Pipeline Analysis', 'Revenue Forecasting']
  },
  {
    id: 'quarterly-review',
    name: 'Quarterly Business Review',
    description: 'Comprehensive quarterly performance analysis with strategic insights.',
    slides: 10,
    tags: ['Strategic', 'Comprehensive'],
    purpose: 'Leadership teams',
    icon: Calendar,
    color: 'from-purple-500 to-indigo-600',
    features: ['Quarterly Summary', 'Key Learnings', 'Next Quarter Plans']
  },
  {
    id: 'customer-insights',
    name: 'Customer Behavior Analysis',
    description: 'Deep dive into customer segments, behavior patterns, and engagement metrics.',
    slides: 6,
    tags: ['Customer-centric', 'Behavioral insights'],
    purpose: 'Product & Marketing',
    icon: Users,
    color: 'from-pink-500 to-rose-600',
    features: ['Customer Segments', 'Behavior Patterns', 'Retention Analysis']
  },
  {
    id: 'financial-overview',
    name: 'Financial Performance Overview',
    description: 'Financial metrics, profitability analysis, and budget performance.',
    slides: 8,
    tags: ['Financial', 'Budget analysis'],
    purpose: 'Finance teams',
    icon: DollarSign,
    color: 'from-emerald-500 to-green-600',
    features: ['Revenue Analysis', 'Cost Breakdown', 'Profitability Metrics']
  }
]

export default function TemplatesPage({
  searchParams,
}: {
  searchParams: Promise<{ demo?: string }>
}) {
  const { user, loading } = useAuth()
  const [isDemo, setIsDemo] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkDemo = async () => {
      const params = await searchParams
      setIsDemo(params.demo === 'true')
      setIsLoading(false)
    }
    checkDemo()
  }, [searchParams])

  // Restrict access to signed-in or demo users
  useEffect(() => {
    if (!isLoading && !loading && !user && !isDemo) {
      router.push('/auth/login')
    }
  }, [user, loading, isDemo, isLoading, router])

  const handleTemplateSelect = (templateId: string) => {
    if (isDemo) {
      router.push(`/demo?template=${templateId}`)
    } else {
      router.push(`/deck-builder/new?template=${templateId}`)
    }
  }

  const handleTryDemo = () => {
    router.push('/demo')
  }

  if (isLoading || loading || (!user && !isDemo)) {
    return null
  }

  return (
    <UnifiedLayout>
      <main className="min-h-screen bg-gradient-to-br from-[#0f172a] to-[#1e293b] py-12 px-4 sm:px-8">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-6">Template Library</h1>
          <p className="text-lg text-gray-300 mb-10">Browse and use professionally designed deck templates to jumpstart your next presentation.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {templates.map((template) => (
              <Card key={template.id} className="group bg-white/5 backdrop-blur-sm border-white/20 hover:bg-white/10 transition-all duration-300 hover:scale-105">
                <CardHeader className="pb-4">
                  {/* Visual Preview */}
                  <div className={`w-full h-48 mb-6 rounded-lg bg-gradient-to-br ${template.color} flex items-center justify-center relative overflow-hidden group-hover:scale-105 transition-transform duration-300`}>
                    <template.icon className="w-16 h-16 text-white z-10" />
                    <div className="absolute inset-0 bg-black/20" />
                    <div className="absolute top-4 right-4">
                      <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                        {template.slides} slides
                      </Badge>
                    </div>
                  </div>
                  
                  <CardTitle className="text-2xl font-bold text-white group-hover:text-blue-300 transition-colors">
                    {template.name}
                  </CardTitle>
                  <CardDescription className="text-blue-200 text-base mt-3">
                    {template.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="space-y-6">
                    {/* Features */}
                    <div>
                      <h4 className="text-sm font-semibold text-blue-300 mb-3 flex items-center">
                        <Zap className="w-4 h-4 mr-2" />
                        Key Features
                      </h4>
                      <ul className="space-y-2">
                        {template.features.map((feature, index) => (
                          <li key={index} className="text-blue-200 text-sm flex items-center">
                            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-3" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2">
                      {template.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="bg-blue-900/50 text-blue-200 border-blue-700/50 text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    {/* Purpose */}
                    <div className="flex items-center text-sm text-blue-300">
                      <Award className="w-4 h-4 mr-2" />
                      For {template.purpose}
                    </div>

                    {/* Action Button */}
                    <Button 
                      onClick={() => handleTemplateSelect(template.id)}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3"
                    >
                      {isDemo ? (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          Try Demo
                        </>
                      ) : (
                        <>
                          Use Template
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
            <Link href="/auth/signup">
              <Button
                variant="gradient"
                size="lg"
                className="w-full sm:w-auto transition-colors"
              >
                🚀 Get Started
              </Button>
            </Link>
            <Link href="/demo">
              <Button
                variant="outline"
                size="lg"
                className="border-blue-400 text-blue-200 hover:bg-blue-400/10 w-full sm:w-auto transition-colors"
              >
                🎯 Try Demo
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </UnifiedLayout>
  )
} 