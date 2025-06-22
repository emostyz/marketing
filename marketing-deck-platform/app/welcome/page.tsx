'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/auth-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  CheckCircle, 
  Brain, 
  Zap, 
  ArrowRight, 
  Star, 
  BarChart3, 
  Users, 
  Shield,
  Sparkles,
  Target,
  Lightbulb
} from 'lucide-react'

export default function WelcomePage() {
  const [currentTip, setCurrentTip] = useState(0)
  const router = useRouter()
  const { user } = useAuth()

  useEffect(() => {
    if (!user) {
      router.push('/auth/login')
    }
  }, [user, router])

  const tips = [
    {
      icon: <Zap className="w-6 h-6 text-blue-400" />,
      title: "Upload Your Data",
      description: "Start by uploading CSV files or connecting your data sources. AEDRIN works best with sales, marketing, and financial data."
    },
    {
      icon: <Brain className="w-6 h-6 text-purple-400" />,
      title: "Let AI Analyze",
      description: "Our AI will automatically identify patterns, trends, and insights in your data. No manual analysis required!"
    },
    {
      icon: <BarChart3 className="w-6 h-6 text-green-400" />,
      title: "Choose Your Template",
      description: "Select from executive summaries, quarterly reviews, or custom presentations tailored to your audience."
    },
    {
      icon: <Target className="w-6 h-6 text-orange-400" />,
      title: "Customize Your Story",
      description: "Edit slides, adjust narratives, and add your branding to make presentations uniquely yours."
    },
    {
      icon: <Sparkles className="w-6 h-6 text-yellow-400" />,
      title: "Export & Present",
      description: "Export to PowerPoint, PDF, or present directly from the platform. Share with stakeholders instantly."
    }
  ]

  const tierLimits = {
    starter: {
      name: "Starter",
      price: "Free",
      presentations: 5,
      dataUploads: 10,
      features: ["Basic templates", "Standard charts", "PDF export"]
    },
    professional: {
      name: "Professional", 
      price: "$29/month",
      presentations: 25,
      dataUploads: 100,
      features: ["Advanced templates", "Interactive charts", "PowerPoint export", "Custom branding"]
    },
    enterprise: {
      name: "Enterprise",
      price: "Custom",
      presentations: "Unlimited",
      dataUploads: "Unlimited", 
      features: ["All templates", "Advanced analytics", "Team collaboration", "API access", "Priority support"]
    }
  }

  const currentTier = user?.subscription === 'free' ? 'starter' : 
                     user?.subscription === 'pro' ? 'professional' : 'enterprise'

  const nextTip = () => {
    setCurrentTip((prev) => (prev + 1) % tips.length)
  }

  const prevTip = () => {
    setCurrentTip((prev) => (prev - 1 + tips.length) % tips.length)
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 py-8">
      <div className="max-w-6xl mx-auto px-6">
        {/* Welcome Header */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-400" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">
            Welcome to AEDRIN, {user.name}! 🎉
          </h1>
          <p className="text-xl text-gray-300 mb-6">
            Your account has been created successfully. Let's get you started with AI-powered presentations.
          </p>
          <Badge variant="outline" className="text-green-400 border-green-400">
            Account Created Successfully
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Tips Section */}
          <Card className="bg-gray-900/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-xl text-white flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-yellow-400" />
                5 Tips to Get the Most Out of AEDRIN
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center">
                    {tips[currentTip].icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {currentTip + 1}. {tips[currentTip].title}
                    </h3>
                    <p className="text-gray-300">
                      {tips[currentTip].description}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex space-x-2">
                    {tips.map((_, index) => (
                      <div
                        key={index}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          index === currentTip ? 'bg-blue-400' : 'bg-gray-600'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={prevTip}
                      className="border-gray-600 text-gray-300 hover:bg-gray-800"
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={nextTip}
                      className="border-gray-600 text-gray-300 hover:bg-gray-800"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Current Tier Section */}
          <Card className="bg-gray-900/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-xl text-white flex items-center gap-2">
                <Star className="w-5 h-5 text-blue-400" />
                Your Current Plan: {tierLimits[currentTier].name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Monthly Price</span>
                  <Badge variant="secondary" className="text-lg font-semibold">
                    {tierLimits[currentTier].price}
                  </Badge>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Presentations per month</span>
                    <span className="text-white font-semibold">
                      {tierLimits[currentTier].presentations}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Data uploads per month</span>
                    <span className="text-white font-semibold">
                      {tierLimits[currentTier].dataUploads}
                    </span>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-white font-semibold mb-2">Included Features:</h4>
                  <ul className="space-y-1">
                    {tierLimits[currentTier].features.map((feature, index) => (
                      <li key={index} className="text-gray-300 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                
                {currentTier === 'starter' && (
                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() => router.push('/pricing')}
                  >
                    Upgrade to Pro
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Feature Overview */}
        <Card className="bg-gray-900/50 border-gray-700 mb-8">
          <CardHeader>
            <CardTitle className="text-xl text-white text-center">
              What Makes AEDRIN Special?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Brain className="w-8 h-8 text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">AI-Powered Analysis</h3>
                <p className="text-gray-300 text-sm">
                  Our AI automatically identifies insights, trends, and patterns in your data
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-green-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Lightning Fast</h3>
                <p className="text-gray-300 text-sm">
                  Create professional presentations in minutes, not hours
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="w-8 h-8 text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Smart Visualizations</h3>
                <p className="text-gray-300 text-sm">
                  Automatically generates the perfect charts for your data
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
            onClick={() => router.push('/onboarding')}
          >
            Complete Your Profile
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-gray-600 text-gray-300 hover:bg-gray-800 px-8 py-3"
            onClick={() => router.push('/dashboard')}
          >
            Go to Dashboard
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-gray-600 text-gray-300 hover:bg-gray-800 px-8 py-3"
            onClick={() => router.push('/pricing')}
          >
            Explore Other Plans
          </Button>
        </div>
      </div>
    </div>
  )
}